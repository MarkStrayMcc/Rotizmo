${
    using Typewriter.Extensions.Types;

    string GetTypeString(Type t) 
    {
        if (t.TypeArguments.Count > 1) 
        {
            return getDictString(t);
        }
        return !t.IsEnum && t.IsPrimitive ? t.Name : string.Format("{0}.{1}", "Models", t.Name);
    }

    string getDictString(Type t)
    {
        var keyType = t.TypeArguments[0];
        var valueType = t.TypeArguments[1];
        return "{ [key: " + GetTypeString(keyType) + "]: " + GetTypeString(valueType) + "; }";
    }

    bool DoesClassHaveBaseClassOfAnotherName(Class c)
    {
      return (c != null && c.BaseClass != null && c.BaseClass.Name != c.Name);
    }

    bool DoesClassHaveAGrandparentClassOfAnotherName(Class c)
    {
      return (c.BaseClass != null && c.BaseClass.BaseClass != null && c.BaseClass.BaseClass.Name != c.BaseClass.Name);
    }

    bool DoesClassPropertiesTypeStringContainModels(Class c)
    {
      return (c != null) && c.Properties.Where(e => e != null && !e.Attributes.Any(a => a.Name.ToUpper() == "TYPESCRIPTIGNORE")).Any(e => GetTypeString(e.Type).IndexOf("Models")>=0);
    }

    bool DoesClassReferToOtherClasses(Class c)
    {
      return DoesClassHaveBaseClassOfAnotherName(c)
        || DoesClassHaveAGrandparentClassOfAnotherName(c)
        || DoesClassPropertiesTypeStringContainModels(c)
        || ((c.BaseClass != null ) && DoesClassPropertiesTypeStringContainModels(c.BaseClass))
        || ((c.BaseClass != null && c.BaseClass.BaseClass != null) && DoesClassPropertiesTypeStringContainModels(c.BaseClass.BaseClass));
    }    

    bool IsPropertyNotIgnored(Property p)
    {
      return p != null && !p.Attributes.Any(a => a.Name.ToUpper() == "TYPESCRIPTIGNORE");
    }

    string GetBaseClassName(Class c)
    {
      if (c != null)
      {
        if (DoesClassHaveAGrandparentClassOfAnotherName(c))
        {
          return c.BaseClass.BaseClass.Name;
        }
        else if (DoesClassHaveBaseClassOfAnotherName(c))
        {
          return c.BaseClass.Name;
        }
        else
        {
          return "";
        }
      }
      else
      {
        return "";
      }      
    }

    bool DoesClassExtendAnother(Class c)
    {
      return DoesClassHaveAGrandparentClassOfAnotherName(c) || DoesClassHaveBaseClassOfAnotherName(c);
    }
}
// This an auto-generated file using TypeWriter extension for Visual Studio.
// Please do not manually edit it. In order to modify the auto-generated class, either modify the ViewModels.tst file
// Or edit the original class that was decorated with ExportToTypeScript attribute
$Classes([ExportToTypeScript])[$DoesClassReferToOtherClasses[
import * as Models from "@app/models/auto-generated";][//no references to import]
export class $Name { $Properties[$IsPropertyNotIgnored[
    public $name: $Type[$GetTypeString];]] $BaseClass[$Properties[$IsPropertyNotIgnored[
    public $name: $Type[$GetTypeString];]]] $BaseClass[$BaseClass[$Properties[$IsPropertyNotIgnored[
    public $name: $Type[$GetTypeString];]]]]
}]$Enums([ExportToTypeScriptEnum])[
    export enum $Name {$Values[
        $name = $Value,]
    }]
